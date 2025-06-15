
import React from 'react';

export const AuthBanner: React.FC = () => {
  return (
    <div className="hidden lg:block flex-1 relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative h-full flex items-center justify-center p-12">
        <div className="text-center text-white space-y-6">
          <h1 className="text-4xl font-bold">
            Discover Your Next
            <br />
            Favorite Movie
          </h1>
          <p className="text-xl text-white/80 max-w-md">
            Stream thousands of movies and TV shows with personalized recommendations just for you.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm text-white/80">Movies & Shows</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">4K</div>
              <div className="text-sm text-white/80">Ultra HD Quality</div>
            </div>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl" />
    </div>
  );
};
