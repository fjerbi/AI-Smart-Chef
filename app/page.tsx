"use client";

import { useState } from "react";
import axios from "axios";
import { Audio } from "react-loader-spinner";
import ReactMarkdown from "react-markdown";

// Define the type for selectedProducts state
type SelectedProducts = {
  [key: string]: string;
};

const products = [
  "Chicken", "Beef", "Fish", "Pork", "Milk", "Cheese", "Yogurt", "Eggs",
  "Carrots", "Broccoli", "Spinach", "Tomatoes", "Potatoes", "Onions", "Peppers",
  "Apples", "Bananas", "Oranges", "Grapes", "Strawberries"
];

export default function Home() {
  // Use appropriate types for state variables
  const [selectedProducts, setSelectedProducts] = useState<SelectedProducts>({});
  const [script, setScript] = useState<string>("");
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const toggleProduct = (product: string) => {
    setSelectedProducts((prev) => {
      if (prev[product]) {
        const updated = { ...prev };
        delete updated[product];
        return updated;
      }
      return { ...prev, [product]: "" };
    });
  };

  const updateQuantity = (product: string, quantity: string) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [product]: quantity,
    }));
  };

  const generateMenu = async () => {
    setLoading(true);
    try {
      const formattedSelection = Object.entries(selectedProducts)
        .map(([product, quantity]) => `${product} (${quantity || "default amount"})`)
        .join(", ");

      const { data } = await axios.post("/api/generate", {
        prompt: `Create a meal plan using only the: ${formattedSelection} with detailed instructions and nutritional information.`
      });

      setScript(data.script);
      const extractedSteps = data.script.match(/\d+\.\s.+/g) || []; // Extracts numbered steps
      setSteps(extractedSteps);
    } catch (error) {
      console.error("Error generating menu:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900 p-6">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">🍽️ AI-Powered Meal Planner</h1>
      <p className="text-gray-600 mb-4 text-center">Select ingredients & specify quantity for a personalized meal plan!</p>

      {/* Product Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 w-full max-w-3xl">
        {products.map((product) => (
          <div key={product} className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg transition duration-300 border border-gray-200 shadow-sm w-full ${selectedProducts[product] ? "bg-blue-600 text-white shadow-md scale-105" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
            <button onClick={() => toggleProduct(product)} className="w-full text-center font-medium">{product}</button>
            {selectedProducts[product] !== undefined && (
              <input
                type="text"
                placeholder="e.g., 200g or 2 pcs"
                value={selectedProducts[product]}
                onChange={(e) => updateQuantity(product, e.target.value)}
                className="mt-2 p-2 w-full text-black rounded-md text-center bg-white border border-gray-300"
              />
            )}
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={generateMenu}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300 shadow-md disabled:opacity-50"
        disabled={loading || Object.keys(selectedProducts).length === 0}
      >
        {loading ? "Generating..." : "Generate Meal Plan"}
      </button>

      {/* Loading Spinner */}
      {loading && (
        <div className="mt-4">
          <Audio height={40} width={40} color="#3b82f6" ariaLabel="loading" />
        </div>
      )}

      {/* Steps Displayed in Horizontal Scrollable Cards */}
      {steps.length > 0 && (
        <div className="mt-6 w-full max-w-3xl overflow-x-auto no-scrollbar flex space-x-4 p-4 bg-gray-100 rounded-lg">
          {steps.map((step, index) => (
            <div key={index} className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-md min-w-[250px] flex-shrink-0 transform transition-transform duration-300 hover:scale-105 ">
              <div className="text-lg font-semibold mb-2">Step {index + 1}</div>
              <div className="text-sm">{step.replace(/^\d+\.\s/, "")}</div>
            </div>
          ))}
        </div>
      )}

      {/* Nutritional Info Displayed in a Markdown Block */}
      {script && (
        <div className="mt-6 w-full max-w-2xl bg-gray-100 p-6 rounded-lg border border-gray-200 shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">🍽️ Nutritional Information:</h2>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            <ReactMarkdown>{script.replace(/\d+\.\s.+/g, "")}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
