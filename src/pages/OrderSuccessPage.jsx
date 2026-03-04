import { Link, useParams } from "react-router-dom";

export default function OrderSuccessPage() {
    const { id } = useParams();
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-5">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-black text-center">Order Placed!</h1>
            <p className="text-sm text-gray-400 text-center max-w-sm">
                Thank you for your order. We will confirm it shortly via SMS.
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Order ID: <span className="text-black">{id?.slice(0, 8).toUpperCase()}</span>
            </p>
            <div className="flex gap-3 mt-2">
                <Link to="/orders" className="bg-black text-white text-xs font-black px-6 py-3 uppercase tracking-widest hover:bg-red-600 transition-colors">MY ORDERS</Link>
                <Link to="/" className="border border-black text-black text-xs font-black px-6 py-3 uppercase tracking-widest hover:bg-gray-50 transition-colors">CONTINUE SHOPPING</Link>
            </div>
        </div>
    );
}