import React from "react";

export default function TextArea({
	rows = 10,
	label,
	name,
	placeholder = "",
	value,
	onChange,
	error = "",
}) {
	return (
		<div className="mb-4">
			{label && (
				<label
					htmlFor={name}
					className="block mb-1 font-medium text-gray-700"
				>
					{label}
				</label>
			)}

			<textarea
				id={name}
				name={name}
				rows={rows}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				aria-invalid={!!error}
				aria-describedby={error ? `${name}-error` : undefined}
				className={`w-full border rounded px-3 py-2 focus:ring-0 focus:outline-none ${error ? "border-red-500" : "border-gray-300 focus:border-blue-500"
					}`}
			/>

			{error && (
				<p id={`${name}-error`} className="text-xs text-red-600 mt-1">
					{error}
				</p>
			)}
		</div>
	);
};
