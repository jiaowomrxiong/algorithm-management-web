export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            验证您的邮箱
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            我们已向您的邮箱发送了一封验证邮件，请查收并点击验证链接完成注册。
          </p>
        </div>
      </div>
    </div>
  );
}
