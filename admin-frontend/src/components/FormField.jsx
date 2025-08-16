import React from "react";

export default function FormField({
	label,
	name,
	type = "text",
	as = "input",       // "input" or "select"
	options = [],
	placeholder = "",
	value,
	onChange,
	error = "",
}) {
	return (
		<div className="mb-4">
			{label && (
				<label htmlFor={name} className="block mb-1 font-medium text-gray-700">
					{label}
				</label>
			)}

			{as === "select" ? (
				<div className="relative">
					<select
						id={name}
						name={name}
						value={value}
						onChange={onChange}
						className={`appearance-none w-full border rounded px-3 py-2 focus:ring-0 focus:outline-none ${error ? "border-red-500" : "border-gray-300 focus:border-blue-500"
							}`}
					>
						{options.map(({ value, label }) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</select>
					{/* chevron */}
					<div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
							<path fillRule="evenodd" d="M5.22 7.22a.75.75 0 011.06 0L10 10.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.28a.75.75 0 010-1.06z" clipRule="evenodd" />
						</svg>
					</div>
				</div>
			) : (
				<input
					id={name}
					name={name}
					type={type}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					aria-invalid={!!error}
					aria-describedby={error ? `${name}-error` : undefined}
					className={`w-full border rounded px-3 py-2 focus:ring-0 focus:outline-none ${error ? "border-red-500" : "border-gray-300 focus:border-blue-500"
						}`}
				/>
			)}

			{error && (
				<p id={`${name}-error`} className="text-xs text-red-600 mt-1">
					{error}
				</p>
			)}
		</div>
	);
};
