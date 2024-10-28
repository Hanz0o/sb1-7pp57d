import { Target, Users, Lightbulb } from 'lucide-react';

export default function About() {
  return (
    <div id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About YISB</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We are dedicated to nurturing the next generation of Bahraini innovators and leaders through comprehensive programs and initiatives.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-600">
              To empower Bahraini youth with the skills and knowledge needed to drive innovation in the digital age.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Community</h3>
            <p className="text-gray-600">
              Building a strong network of young innovators, mentors, and industry leaders across Bahrain.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Innovation</h3>
            <p className="text-gray-600">
              Fostering creativity and technological advancement through hands-on projects and workshops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}