import { Moon, Sun, Coffee } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-[#242424] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gray-900 dark:bg-white p-2.5 rounded-xl">
              <Coffee className="w-5 h-5 text-white dark:text-gray-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                COFFEE COSTING
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage ingredients and calculate costs for your coffee recipes
              </p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;