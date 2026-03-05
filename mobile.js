const fs = require('fs');
const files = [
  'src/components/landing/LandingHero.tsx',
  'src/components/landing/ProblemSection.tsx',
  'src/components/landing/HowItWorks.tsx',
  'src/components/landing/LandingFeatures.tsx'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  
  c = c.replace(/text-5xl md:text-6xl lg:text-7xl/g, 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl');
  c = c.replace(/text-4xl md:text-5xl/g, 'text-3xl sm:text-4xl md:text-5xl');
  c = c.replace(/text-3xl md:text-5xl/g, 'text-2xl sm:text-3xl md:text-5xl');
  c = c.replace(/text-2xl font-bold/g, 'text-xl sm:text-2xl font-bold');
  c = c.replace(/text-xl font-bold/g, 'text-lg sm:text-xl font-bold');
  c = c.replace(/text-lg md:text-xl/g, 'text-base sm:text-lg md:text-xl');
  
  c = c.replace(/p-8/g, 'p-6 md:p-8');
  c = c.replace(/py-24/g, 'py-16 md:py-24');
  c = c.replace(/py-16 md:py-24/g, 'py-12 sm:py-16 md:py-24');
  c = c.replace(/gap-8/g, 'gap-6 md:gap-8');
  c = c.replace(/gap-12/g, 'gap-8 md:gap-12');
  
  c = c.replace(/w-32 h-32/g, 'w-24 h-24 md:w-32 md:h-32');
  c = c.replace(/w-20 h-20/g, 'w-16 h-16 md:w-20 md:h-20');
  c = c.replace(/w-12 h-12/g, 'w-10 h-10 md:w-12 md:h-12');
  c = c.replace(/w-10 h-10/g, 'w-8 h-8 md:w-10 md:h-10');
  c = c.replace(/w-6 h-6/g, 'w-5 h-5 md:w-6 md:h-6');
  
  if (f.includes('LandingHero')) {
      c = c.replace(/px-8 h-14/g, 'px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base');
      c = c.replace(/aspect-square md:aspect-video lg:aspect-square/g, 'aspect-[4/3] md:aspect-video lg:aspect-square');
      c = c.replace(/h-10 bg-gray-800\/80/g, 'h-8 sm:h-10 bg-gray-800/80');
      c = c.replace(/p-6 font-mono/g, 'p-4 sm:p-6 font-mono');
      c = c.replace(/min-h-\[90vh\]/g, 'min-h-[100svh]');
  }

  fs.writeFileSync(f, c);
});
console.log('Mobile responsiveness improvements applied successfully.');
