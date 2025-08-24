export default function Header() {
	return (
		<header className="sticky top-0 z-20 bg-white">
			<div className="mx-auto max-w-3xl py-6 px-6 md:px-0 flex items-center justify-between">
				<a href="/" className="group inline-flex items-center gap-2">
					<div className="h-9 w-9 rounded text-sm bg-slate-900 text-white grid place-items-center font-semibold group-hover:rotate-6 transition">
						SJD
					</div>
					<span className="font-medium">Blog</span>
				</a>
				<nav className="text-base text-slate-800 flex items-center gap-4">
					<a href="/" className="hover:text-blue-700">Home</a>
					<a href="/about" className="hover:text-blue-700">About</a>
				</nav>
			</div>
		</header>
	);
};
