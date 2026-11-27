/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustStats } from './components/TrustStats';
import { CoverageSection } from './components/CoverageSection';
import { ComparisonTable } from './components/ComparisonTable';
import { AboutSection } from './components/AboutSection';
import { VideosSection } from './components/VideosSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { BoletoModal } from './components/BoletoModal';
import { AdminModal } from './components/AdminModal';
import { MobileQuickBar } from './components/MobileQuickBar';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CarouselSlide, CarouselVideo, CustomerTestimonial } from './types';
import {
  DEFAULT_CAROUSEL_SLIDES,
  DEFAULT_CAROUSEL_VIDEO_ITEMS,
} from './utils/storage';
import {
  subscribeCarouselSlides,
  subscribeCarouselVideos,
  subscribeApprovedTestimonials,
} from './utils/firestoreDb';

export default function App() {
  const [isBoletoOpen, setIsBoletoOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(
    DEFAULT_CAROUSEL_SLIDES
  );
  const [carouselVideos, setCarouselVideos] = useState<CarouselVideo[]>(
    DEFAULT_CAROUSEL_VIDEO_ITEMS
  );
  const [approvedTestimonials, setApprovedTestimonials] = useState<
    CustomerTestimonial[]
  >([]);

  useEffect(() => {
    const unsubSlides = subscribeCarouselSlides((slides) => {
      setCarouselSlides(slides);
    });
    const unsubVideos = subscribeCarouselVideos((videos) => {
      setCarouselVideos(videos);
    });
    const unsubTestimonials = subscribeApprovedTestimonials((items) => {
      setApprovedTestimonials(items);
    });

    return () => {
      unsubSlides();
      unsubVideos();
      unsubTestimonials();
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-16 sm:pb-0">
        {/* 1. Header (Navigation & Emergency Line) */}
        <Header onOpenBoletoModal={() => setIsBoletoOpen(true)} />

        {/* 2. Main Page Content */}
        <main className="flex-1">
          {/* Hero Section with Proposition & Lead Quote Form */}
          <Hero
            carouselSlides={carouselSlides}
            onOpenBoletoModal={() => setIsBoletoOpen(true)}
          />

          {/* Quantitative Proof Strip */}
          <TrustStats />

          {/* Bento Grid: Coberturas, Assistências & Tecnologia */}
          <CoverageSection />

          {/* Comparison: Center Auto vs Traditional */}
          <ComparisonTable />

          {/* Institutional: Quem Somos, Missão, Visão & Valores */}
          <AboutSection />

          {/* Videos Section directly above Testimonials */}
          <VideosSection videos={carouselVideos} />

          {/* Customer Testimonials with Ratings & Photos */}
          <TestimonialsSection
            userTestimonials={approvedTestimonials}
            onTestimonialSubmitted={() => {
              // Real-time approved listener automatically reflects comments once approved by admin
            }}
          />

          {/* FAQ: Dúvidas Frequentes */}
          <FaqSection />
        </main>

        {/* 3. Footer */}
        <Footer
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenBoleto={() => setIsBoletoOpen(true)}
        />

        {/* 4. Mobile Quick Action Floating Bar */}
        <MobileQuickBar onOpenBoletoModal={() => setIsBoletoOpen(true)} />

        {/* 5. Floating WhatsApp Customer Service Button */}
        <WhatsAppFloatingButton />

        {/* 6. Modals */}
        <BoletoModal
          isOpen={isBoletoOpen}
          onClose={() => setIsBoletoOpen(false)}
        />

        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onSlidesUpdate={(updated) => setCarouselSlides(updated)}
          onVideosUpdate={(updated) => setCarouselVideos(updated)}
          onTestimonialsUpdate={(updated) =>
            setApprovedTestimonials(updated.filter((t) => t.status === 'approved'))
          }
        />
      </div>
    </ErrorBoundary>
  );
}
