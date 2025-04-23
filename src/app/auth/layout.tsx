export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">算法管理系统</h1>
          <p className="text-sm text-gray-500 mt-1">专业的算法管理与部署平台</p>
        </div>
        {children}
      </div>
    </div>
  );
}
