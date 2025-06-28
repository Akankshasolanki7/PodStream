import React from 'react';
import { motion } from 'framer-motion';

const Categories = () => {
const categories = [
  {
    name: "Comedy",
    gradient: "from-purple-200 via-lavender-200 to-pink-200",
    hoverGradient: "hover:from-purple-300 hover:via-lavender-300 hover:to-pink-300",
    textColor: "text-purple-800",
    shadowColor: "shadow-purple-200/40",
    borderColor: "border-purple-100",
    to: "/categories/comedy",
    img: "https://cdn-icons-png.flaticon.com/512/9131/9131133.png"
  },
  {
    name: "Business",
    gradient: "from-green-200 via-teal-200 to-cyan-200",
    hoverGradient: "hover:from-green-300 hover:via-teal-300 hover:to-cyan-300",
    textColor: "text-green-800",
    shadowColor: "shadow-green-200/40",
    borderColor: "border-green-100",
    to: "/categories/business",
    img: "https://cdn-icons-png.flaticon.com/512/3465/3465175.png"
  },
  {
    name: "Education",
    gradient: "from-rose-200 via-pink-200 to-red-200",
    hoverGradient: "hover:from-rose-300 hover:via-pink-300 hover:to-red-300",
    textColor: "text-rose-800",
    shadowColor: "shadow-rose-200/40",
    borderColor: "border-rose-100",
    to: "/categories/education",
    img: "https://cdn-icons-png.flaticon.com/512/3135/3135758.png"
  },
  {
    name: "Hobbies",
    gradient: "from-yellow-200 via-amber-200 to-orange-200",
    hoverGradient: "hover:from-yellow-300 hover:via-amber-300 hover:to-orange-300",
    textColor: "text-yellow-800",
    shadowColor: "shadow-yellow-200/40",
    borderColor: "border-yellow-100",
    to: "/categories/hobbies",
    img: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
  },
  {
    name: "Government",
    gradient: "from-blue-200 via-sky-200 to-indigo-200",
    hoverGradient: "hover:from-blue-300 hover:via-sky-300 hover:to-indigo-300",
    textColor: "text-blue-800",
    shadowColor: "shadow-blue-200/40",
    borderColor: "border-blue-100",
    to: "/categories/government",
    img: "https://cdn-icons-png.flaticon.com/512/2991/2991146.png"
  },
];


  return (
   <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-16 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-teal-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>

      <div className="px-6 lg:px-12 py-4 relative z-0">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4 pb-3">
            Explore Categories
          </h1>
          <p className="text-slate-600 text-lg lg:text-xl max-w-2xl mx-auto">
            Discover podcasts that match your interests and passions.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6 rounded-full"></div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <a
                href={category.to}
                className={`block p-6 lg:p-8 rounded-3xl bg-gradient-to-br ${category.gradient} ${category.hoverGradient} border ${category.borderColor} shadow-lg ${category.shadowColor} hover:shadow-xl transition-all duration-300 overflow-hidden h-full`}
              >
                {/* Icon */}
                <div className="relative mb-6 w-28 h-28 mx-auto bg-white/50 backdrop-blur-md rounded-2xl shadow-inner flex items-center justify-center overflow-hidden group-hover:bg-white/70 transition duration-300">
                  <img
                    src={category.img}
                    alt={category.name}
                    className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Text */}
                <h2 className={`text-center text-lg lg:text-xl font-bold capitalize ${category.textColor} group-hover:scale-105 transition-transform duration-300`}>
                  {category.name}
                </h2>

                {/* Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {/* Footer Line */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-2 text-slate-500">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-slate-300 rounded"></div>
            <span className="text-sm font-medium">Browse all categories</span>
            <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-slate-300 rounded"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Categories;
