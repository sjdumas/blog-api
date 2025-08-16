export default function DashboardStat({ title, value }) {
	return (
		<div className="rounded border border-gray-300 p-4 text-center">
			<h3 className="text-sm text-gray-500 mb-1">{title}</h3>
			<p className="text-2xl font-semibold">{value}</p>
		</div>
	);
};
