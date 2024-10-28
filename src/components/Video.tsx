import { Play } from 'lucide-react';
import { useState } from 'react';

export default function Video() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch how YISB is shaping the future of Bahrain's youth
          </p>
        </div>

        <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
          {!isPlaying ? (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80')`
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition group"
                >
                  <Play className="h-8 w-8 text-white ml-1" />
                </button>
              </div>
            </div>
          ) : (
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/your-video-id?autoplay=1"
              title="YISB Introduction"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
}