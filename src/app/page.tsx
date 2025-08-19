export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Voice Networking Made Simple
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Capture contact details through natural voice conversations. 
          Skip the typing, skip the forms – just talk.
        </p>
        <div className="space-y-4">
          <a
            href="/auth/login"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </a>
          <p className="text-sm text-gray-500">
            Sign in with your email to create your voice networking page
          </p>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quick Setup
            </h3>
            <p className="text-gray-600">
              Configure your unique voice page and connect to your CRM in under 2 minutes.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Natural Conversations
            </h3>
            <p className="text-gray-600">
              Attendees share their details through voice – no typing required.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Instant Integration
            </h3>
            <p className="text-gray-600">
              Contacts automatically sync to your GHL CRM with proper formatting.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
