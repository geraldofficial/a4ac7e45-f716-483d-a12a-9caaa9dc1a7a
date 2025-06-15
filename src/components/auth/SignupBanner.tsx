
import React from 'react';

export const SignupBanner: React.FC = () => {
  return (
    <div className="hidden lg:block flex-1 relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative h-full flex items-center justify-center p-12">
        <div className="text-center text-white space-y-6">
          <h1 className="text-4xl font-bold">
            Start Your Journey
            <br />
            Into Entertainment
          </h1>
          <p className="text-xl text-white/80 max-w-md">
            Get personalized movie recommendations, create watchlists, and never miss your favorite shows.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">Free</div>
              <div className="text-sm text-white/80">No Subscription</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">HD</div>
              <div className="text-sm text-white/80">High Quality</div>
            </div>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-xl" />
    </div>
  );
};
