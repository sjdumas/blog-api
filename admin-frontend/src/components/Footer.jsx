import React from "react";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="w-full mt-8 py-4 px-4 bg-gray-50">
			<div className="px-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
				<p>&copy; {currentYear} Blog Admin Panel</p>
				<p className="mt-2 sm:mt-0">Built with <span className="text-red-500">❤</span> using React, Node.js, and TailwindCSS.</p>
			</div>
		</footer>
	);
};
