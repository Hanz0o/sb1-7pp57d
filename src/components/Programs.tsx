import { Code, Brain, Presentation } from 'lucide-react';

export default function Programs() {
  return (
    <div id="programs" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Programs</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our range of programs designed to develop skills and foster innovation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <Code className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tech Bootcamps</h3>
              <p className="text-gray-600 mb-4">
                Intensive coding and technology workshops focused on practical skills development.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Web Development</li>
                <li>• Mobile Apps</li>
                <li>• AI & Machine Learning</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <Brain className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Innovation Lab</h3>
              <p className="text-gray-600 mb-4">
                Hands-on experience with cutting-edge technologies and innovation methodologies.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Design Thinking</li>
                <li>• Prototyping</li>
                <li>• Problem Solving</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <Presentation className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Leadership Track</h3>
              <p className="text-gray-600 mb-4">
                Developing the next generation of Bahraini tech leaders and entrepreneurs.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Project Management</li>
                <li>• Public Speaking</li>
                <li>• Entrepreneurship</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}