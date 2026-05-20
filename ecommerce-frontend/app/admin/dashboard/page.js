"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    LineElement,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

export default function AdminDashboard() {
    const [sales, setSales] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stock, setStock] = useState([]);
    const [category, setCategory] = useState([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await api.get("/admin/stats"); // requires backend route
            setSales(res.data.sales);
            setOrders(res.data.orders);
            setStock(res.data.stock);
            setCategory(res.data.category);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container" style={{ paddingTop: 20 }}>
            <h1 className="h1">Admin Dashboard</h1>

            <div className="grid" style={{ marginTop: 30 }}>
                {/* Sales Line Chart */}
                <div className="card" style={{ padding: 20 }}>
                    <h3>Sales (₹) Over Time</h3>
                    <Line
                        data={{
                            labels: sales.map((s) => s.date),
                            datasets: [
                                {
                                    label: "Sales (₹)",
                                    data: sales.map((s) => s.amount),
                                    borderColor: "#B57EDC",
                                    backgroundColor: "rgba(181, 126, 220, 0.3)",
                                },
                            ],
                        }}
                    />
                </div>

                {/* Orders Bar Chart */}
                <div className="card" style={{ padding: 20 }}>
                    <h3>Orders per Day</h3>
                    <Bar
                        data={{
                            labels: orders.map((o) => o.date),
                            datasets: [
                                {
                                    label: "Orders",
                                    data: orders.map((o) => o.count),
                                    backgroundColor: "#FFB6B3",
                                },
                            ],
                        }}
                    />
                </div>

                {/* Stock Levels */}
                <div className="card" style={{ padding: 20 }}>
                    <h3>Stock Levels</h3>
                    <Bar
                        data={{
                            labels: stock.map((s) => s.name),
                            datasets: [
                                {
                                    label: "Stock",
                                    data: stock.map((s) => s.stock),
                                    backgroundColor: "#ACE1AF",
                                },
                            ],
                        }}
                    />
                </div>

                {/* Category Pie Chart */}
                <div className="card" style={{ padding: 20 }}>
                    <h3>Category Distribution</h3>
                    <Pie
                        data={{
                            labels: category.map((c) => c.name),
                            datasets: [
                                {
                                    data: category.map((c) => c.count),
                                    backgroundColor: ["#B57EDC", "#FFB6B3", "#ACE1AF"],
                                },
                            ],
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
