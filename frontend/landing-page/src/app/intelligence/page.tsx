<div>
<h2 className="text-lg font-semibold text-gs-gray-900">Top Predicted Risks</h2>
<p className="text-sm text-gs-gray-500">Assets ranked by AI-predicted failure probability</p>
</div>
<Link href="/map-explorer" className="text-xs text-gs-blue-600 font-medium hover:underline">
View on Map →
</Link>
</div>
<table className="w-full">
<thead className="bg-gs-gray-50 border-b border-gs-gray-200">
<tr className="text-left text-xs uppercase tracking-widest text-gs-gray-500">
<th className="px-6 py-3 font-semibold">Asset</th>
<th className="px-6 py-3 font-semibold">Type</th>
<th className="px-6 py-3 font-semibold">Risk Score</th>
<th className="px-6 py-3 font-semibold">Level</th>
<th className="px-6 py-3 font-semibold">Action</th>
</tr>
</thead>
<tbody>
{nodeRisks.map(([id, risk]) => {
const level = risk > 0.7 ? "Critical" : risk > 0.4 ? "High" : risk > 0.2 ? "Warning" : "Healthy";
const badgeClass = risk > 0.7 ? "bg-red-100 text-red-700 border-red-200" :
risk > 0.4 ? "bg-amber-100 text-amber-700 border-amber-200" :
risk > 0.2 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
"bg-green-100 text-green-700 border-green-200";
return (
<tr key={id} className="border-b border-gs-gray-100 hover:bg-gs-gray-50">
<td className="px-6 py-4">
<div className="font-mono font-bold text-gs-gray-900">{id}</div>
</td>
<td className="px-6 py-4 text-sm text-gs-gray-600">Transformer</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-32 h-1.5 bg-gs-gray-100 rounded-full overflow-hidden">
<div className="h-full bg-gs-blue-500 rounded-full" style={{ width: `${risk * 100}%` }} />
</div>
<span className="font-mono text-sm font-semibold text-gs-gray-900">{Math.round(risk * 100)}%</span>
</div>
</td>
<td className="px-6 py-4">
<span className={`inline-block px-2 py-0.5 rounded-full border text-xs font-medium ${badgeClass}`}>
{level}
</span>
</td>
<td className="px-6 py-4">
<Link href="/map-explorer" className="text-xs text-gs-blue-600 hover:underline">View →</Link>
</td>
</tr>
);
})}
</tbody>