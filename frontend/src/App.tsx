import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/Hero';

function App() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div className="bg-hero-bg min-h-screen">
      <Navbar onOpenAssessment={() => setIsModalOpen(true)} />
      <HeroSection
        isModalOpen={isModalOpen}
        onOpenModal={() => setIsModalOpen(true)}
        onCloseModal={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default App;
