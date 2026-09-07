"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Zap } from "lucide-react";

const NAV_LINKS = [
{ href: "/", label: "Home" },
{ href: "/about", label: "About Us" },
{ href: "/map-explorer", label: "Map Explorer" },
{ href: "/intelligence", label: "Intelligence" },
{ href: "/analytics", label: "Analytics" },
{ href: "/alerts", label: "Alerts" },
{ href: "/documentation", label: "Resources" },
];

export function Navbar({ variant = "light" }: { variant?: "light" | "dark" | "transparent" }) {
const pathname = usePathname();
const [scrolled, setScrolled] = useState(false);
const [mobileOpen, setMobileOpen] = useState(false);

useEffect(() => {
const onScroll = () => setScrolled(window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll);
return () => window.removeEventListener("scroll", onScroll);
}, []);

const isDarkContext = variant === "dark" || variant === "transparent";

const bgClass = !scrolled && variant === "transparent"
? "bg-transparent border-transparent"
: isDarkContext
? "bg-gs-bg-primary/85 backdrop-blur-lg border-gs-border"
: "bg-white/95 backdrop-blur-md border-gs-gray-200";

const textClass = isDarkContext ? "text-gs-text-primary" : "text-gs-gray-900";
const secondaryTextClass = isDarkContext ? "text-gs-text-secondary" : "text-gs-gray-600";
const linkHoverClass = isDarkContext ? "hover:text-gs-cyan-400" : "hover:text-gs-blue-600";

return (
<header
className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${bgClass} ${
scrolled ? "h-14" : "h-16"
}`}
>
<div className="container-official h-full flex items-center justify-between">
<Link href="/" className={`group flex items-center gap-2.5 ${textClass}`}>
<div className="w-8 h-8 rounded-md bg-gradient-to-br from-gs-blue-500 to-gs-cyan-500 flex items-center justify-center transition-transform group-hover:scale-105">
<Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
</div>
<div className="leading-tight">
<div className="text-sm font-bold tracking-tight">GridSense</div>
<div className={`text-[9px] font-medium uppercase tracking-widest ${secondaryTextClass}`}>
National Grid Intelligence
</div>
</div>
</Link>

<nav className="hidden lg:flex items-center gap-1">
{NAV_LINKS.map((link) => {
const active = pathname === link.href;
return (
<Link
key={link.href}
href={link.href}
className={`relative px-3 py-2 text-[13px] font-medium rounded-md transition-colors ${textClass} ${linkHoverClass} ${
active ? (isDarkContext ? "text-gs-cyan-400" : "text-gs-blue-600") : ""
}`}
>
{link.label}
{active && (
<span
className={`absolute left-2 right-2 -bottom-0.5 h-0.5 rounded-full ${
isDarkContext ? "bg-gs-cyan-500" : "bg-gs-blue-500"
}`}
/>
)}
</Link>
);
})}
</nav>

<div className="hidden lg:flex items-center gap-3">
<Link
href="/login"
className={`px-4 py-1.5 text-[13px] font-medium rounded-md border transition-colors ${
isDarkContext
? "border-gs-border text-gs-text-primary hover:bg-gs-bg-panel"
: "border-gs-gray-300 text-gs-gray-700 hover:bg-gs-gray-50"
}`}
>
Login
</Link>
<Link
href="/dashboard"
className={`px-4 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${
isDarkContext
? "bg-gs-cyan-500 text-gs-bg-primary hover:bg-gs-cyan-400"
: "bg-gs-blue-500 text-white hover:bg-gs-blue-600"
}`}
>
Get Started
</Link>
</div>

<button
className={`lg:hidden ${textClass}`}
onClick={() => setMobileOpen(!mobileOpen)}
aria-label="Toggle menu"
>
{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
</button>
</div>

{mobileOpen && (
<div className={`lg:hidden absolute top-full left-0 right-0 border-b shadow-lg ${
isDarkContext ? "bg-gs-bg-secondary border-gs-border" : "bg-white border-gs-gray-200"
}`}>
<nav className="container-official py-4 flex flex-col gap-1">
{NAV_LINKS.map((link) => (
<Link
key={link.href}
href={link.href}
onClick={() => setMobileOpen(false)}
className={`px-3 py-2.5 text-sm font-medium rounded-md ${
pathname === link.href
? isDarkContext ? "text-gs-cyan-400 bg-gs-bg-panel" : "text-gs-blue-600 bg-gs-blue-50"
: isDarkContext ? "text-gs-text-primary hover:bg-gs-bg-panel" : "text-gs-gray-800 hover:bg-gs-gray-50"
}`}
>
{link.label}
</Link>
))}
<div className="mt-2 pt-2 border-t border-gs-border flex gap-2">
<Link
href="/login"
onClick={() => setMobileOpen(false)}
className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md border ${
isDarkContext ? "border-gs-border text-white" : "border-gs-gray-300 text-gs-gray-700"
}`}
>
Login
</Link>
<Link
href="/dashboard"
onClick={() => setMobileOpen(false)}
className={`flex-1 text-center px-4 py-2 text-sm font-semibold rounded-md ${
isDarkContext ? "bg-gs-cyan-500 text-gs-bg-primary" : "bg-gs-blue-500 text-white"
}`}
>
Get Started
</Link>
</div>
</nav>
</div>
)}
</header>
);
}