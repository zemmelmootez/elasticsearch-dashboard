import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useElasticsearch } from "./useElasticsearch";
import { DatePicker, Slider, RangePicker } from "antd";
import "rc-slider/assets/index.css";
import moment from "moment";

// Define the colors for the Pie chart
const COLORS = ["#00BFB3", "#2B2B2B", "#FF6384", "#36A2EB", "#FFCE56"];

const SalesDashboard = () => {
  const { data, loading, error, searchData } = useElasticsearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    minPrice: 0,
    maxPrice: 500,
    category: "",
  });

  // Handle date filter change
  const handleDateFilterChange = (dates) => {
    setFilters({
      ...filters,
      startDate: dates ? dates[0] : null,
      endDate: dates ? dates[1] : null,
    });
  };

  // Handle category filter change
  const handleCategoryFilterChange = (e) => {
    setFilters({
      ...filters,
      category: e.target.value,
    });
  };

  // Handle price filter change
  const handlePriceFilterChange = (value) => {
    setFilters({
      ...filters,
      minPrice: value[0],
      maxPrice: value[1],
    });
  };

  // Filter and aggregate data based on filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesPrice =
        item.price >= filters.minPrice && item.price <= filters.maxPrice;
      const matchesCategory = filters.category
        ? item.category.toLowerCase().includes(filters.category.toLowerCase())
        : true;
      const matchesDate =
        (!filters.startDate ||
          moment(item.timestamp).isAfter(filters.startDate)) &&
        (!filters.endDate || moment(item.timestamp).isBefore(filters.endDate));

      return matchesPrice && matchesCategory && matchesDate;
    });
  }, [data, filters]);

  // Aggregate data by category
  const categoryData = filteredData.reduce((acc, item) => {
    const existing = acc.find((cat) => cat.category === item.category);
    if (existing) {
      existing.revenue += item.revenue;
      existing.quantity += item.quantity_sold;
    } else {
      acc.push({
        category: item.category,
        revenue: item.revenue,
        quantity: item.quantity_sold,
      });
    }
    return acc;
  }, []);

  // Daily sales trend
  const dailySales = filteredData.reduce((acc, item) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    const existing = acc.find((sale) => sale.date === date);
    if (existing) {
      existing.revenue += item.revenue;
    } else {
      acc.push({ date, revenue: item.revenue });
    }
    return acc;
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    searchData(searchTerm);
  };

  if (loading) return <div className="loading-text">Loading...</div>;
  if (error) return <div className="error-text">Error: {error.message}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Sales Dashboard</h1>

      {/* Search and Filter Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Filter and Search</h2>
        <form onSubmit={handleSearch} className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full p-3 border rounded-md mb-4"
          />
          <button
            type="submit"
            className="bg-teal-600 text-white px-6 py-2 rounded-md"
          >
            Search
          </button>
        </form>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Category</h3>
            <input
              type="text"
              value={filters.category}
              onChange={handleCategoryFilterChange}
              placeholder="Filter by category..."
              className="w-full p-3 border rounded-md"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Date Range</h3>
            <DatePicker.RangePicker
              format="YYYY-MM-DD"
              value={[filters.startDate, filters.endDate]}
              onChange={handleDateFilterChange}
              className="w-full"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Price Range</h3>
            <Slider
              range
              min={0}
              max={1000}
              value={[filters.minPrice, filters.maxPrice]}
              onChange={handlePriceFilterChange}
              step={10}
            />
            <div className="flex justify-between text-sm mt-2">
              <span>${filters.minPrice}</span>
              <span>${filters.maxPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Revenue Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Revenue by Category</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={categoryData}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="revenue"
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Daily Sales Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Daily Sales Trend</h2>
          <BarChart width={400} height={300} data={dailySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#2B2B2B" />
          </BarChart>
        </div>
      </div>

      {/* Product Table */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Product Sales Details</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Quantity Sold</th>
              <th className="p-3 text-left">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">${product.price.toFixed(2)}</td>
                <td className="p-3">{product.quantity_sold}</td>
                <td className="p-3">${product.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesDashboard;
