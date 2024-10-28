import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our programs? We'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start">
              <Mail className="h-6 w-6 text-red-600 mt-1" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold mb-1">Email Us</h3>
                <p className="text-gray-600">contact@yisb.org</p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="h-6 w-6 text-red-600 mt-1" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold mb-1">Call Us</h3>
                <p className="text-gray-600">+973 1234 5678</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-6 w-6 text-red-600 mt-1" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold mb-1">Visit Us</h3>
                <p className="text-gray-600">Manama, Kingdom of Bahrain</p>
              </div>
            </div>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}