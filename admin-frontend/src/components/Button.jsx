export default function Button({
	type = "button",
	children,
	onClick,
	disabled = false,
	className = "",
	buttonType = "basic", // "basic" or "small"
	variant = "solid",    // "solid", "outline", "important"
}) {
	const base = {
		basic: "px-4 py-2 rounded focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed !mt-0",
		small: "px-3 py-1 rounded focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed !mt-0",
	};
	const variants = {
		solid: "bg-black border border-black text-white hover:bg-blue-600 hover:border-blue-600",
		outline: "bg-white border border-black text-black hover:bg-black hover:text-white",
		secondary: "bg-blue-600 border border-blue-600 text-white hover:bg-blue-700 hover:text-white hover:border-blue-700",
		warning: "bg-red-500 border border-red-500 text-white hover:bg-red-600 hover:border-red-600",
	};

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`${variants[variant]} ${base[buttonType]} ${className}`}
		>
			{children}
		</button>
	);
};
