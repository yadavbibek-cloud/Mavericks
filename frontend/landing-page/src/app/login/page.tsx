const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setTimeout(() => router.push("/dashboard"), 500);
};

return (
<div className="min-h-screen flex bg-white">