import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
	return (
		<div className="min-h-screen flex flex-col bg-white text-slate-700">
			<Header />
			<main className="w-full px-6 py-10">
				{/* Global container (single source of truth for width) */}
				<div
					className="mx-auto w-full"
					style={{
						maxWidth: "768px",
					}}
				>
					{children}
				</div>
			</main>
			<Footer />
		</div>
	);
};
