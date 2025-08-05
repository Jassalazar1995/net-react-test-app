import { Link } from 'react-router-dom';

const Test = () => {
  return (
    <div className="min-h-screen bg-[#242424] text-white flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-[3.2em] leading-tight font-normal mb-8">
          Test Page
        </h1>
        
        <div className="p-8 mb-8">
          <p className="text-xl mb-6">
            Welcome to the test page! This is a new page created with React Router.
          </p>
          
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="text-left space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Tailwind CSS styling
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  React Router navigation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  TypeScript support
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Responsive design
                </li>
              </ul>
            </div>
            
            <div className="bg-[#1a1a1a] p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                  Action 1
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                  Action 2
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                  Action 3
                </button>
              </div>
            </div>
          </div>
        </div>

        <Link 
          to="/" 
          className="inline-block bg-[#646cff] hover:bg-[#535bf2] text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
        >
          ← Back to Home
        </Link>
        
        <p className="text-[#888] mt-8">
          This test page demonstrates routing in the Ion Innovations app.
        </p>
      </div>
    </div>
  );
};

export default Test;