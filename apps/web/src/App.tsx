import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "./services/api";

function App() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-bold">OutTimer Finanças</h1>
        {isLoading && <p className="mt-2 text-slate-400">Verificando API...</p>}
        {isError && (
          <p className="mt-2 text-red-400">Não foi possível conectar à API</p>
        )}
        {data && (
          <p className="mt-2 text-emerald-400">
            API online — status: {data.status}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
