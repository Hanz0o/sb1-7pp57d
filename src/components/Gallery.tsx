import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const images = [
  {
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
    title: 'Meeting with Ministry of Youth Officials',
    description: 'Discussing youth empowerment initiatives with government leaders'
  },
  {
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80',
    title: 'Innovation Workshop',
    description: 'Students participating in our hands-on technology workshops'
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80',
    title: 'Tech Conference 2023',
    description: 'YISB members presenting their projects at the annual tech conference'
  }
];

export default function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our journey of empowering Bahraini youth through various initiatives
          </p>
        </div>

        <div className="relative">
          <div className="aspect-[16/9] overflow-hidden rounded-xl">
            <div className="relative h-full">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${image.url}')` }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-30" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                    <p className="text-lg">{image.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>

          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {images.map((image, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden shadow-lg cursor-pointer"
              onClick={() => setCurrentIndex(index)}
            >
              <div
                className="aspect-video bg-cover bg-center"
                style={{ backgroundImage: `url('${image.url}')` }}
              />
              <div className="p-4 bg-white">
                <h4 className="font-semibold text-gray-900">{image.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}