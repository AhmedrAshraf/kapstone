import React, { useState } from 'react';
import { Mail, Phone, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { sendEmail } from '../utils/emailUtils';

type ContactType = 'patient' | 'professional' | 'other';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  type: ContactType;
  message: string;
}

export function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    type: 'patient',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add scroll to top functionality
  useScrollToTop();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if(!formData.email || !formData.name || !formData.phone || !formData.message){
        throw new Error('All fields are required');
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const { error } = await supabase
          .from('contacts')
          .insert([formData]);
      if (error) throw error;

      await sendEmail(
        'kapstoneclinics@gmail.com',
        "Contact Us",
        `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone}</p>
            <p><strong>Type:</strong> ${formData.type}</p>
            <p style="border-left: 4px solid #007bff; padding-left: 10px; color: #555;">
              ${formData.message}
            </p>
            <br>
            <footer style="text-align: center; font-size: 12px; color: #aaa;">
              <p>Best Regards,</p>
              <p><strong>Kapstone Clinic Team</strong></p>
            </footer>
          </div>
        `
      );      

      // Attempt to send the message
      // const { data, error: submitError } = await supabase.functions.invoke('contact', {
      //   body: formData,
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });

      // if (submitError) {
      //   // Handle specific error cases
      //   if (submitError.message?.includes('Rate limit exceeded')) {
      //     throw new Error('Too many attempts. Please try again later.');
      //   } else if (submitError.message?.includes('bounce')) {
      //     throw new Error('Unable to send to this email address. Please use a different email.');
      //   } else {
      //     throw submitError;
      //   }
      // }

      // if (!data?.success) {
      //   throw new Error('Failed to send message. Please try again.');
      // }

      // Success
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'patient',
        message: ''
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-kapstone-sage mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-kapstone-purple mb-4">
              Thank You for Getting in Touch!
            </h2>
            <p className="text-gray-600 mb-6">
              We've received your message and will get back to you as soon as possible.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-kapstone-sage hover:text-kapstone-sage-dark"
            >
              Send another message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Full-height background section */}
      <div className="relative min-h-screen">
        {/* Background image and overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e"
            alt="Peaceful mountain lake at sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/10" />
        </div>

        {/* Content */}
        <div className="relative pt-36 pb-12">
          {/* Title Section */}
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl font-bold sm:text-5xl text-shadow-lg">Get in Touch</h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl">
              Have a question or want to learn more? We're here to help.
            </p>
          </div>

          {/* Form Section */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    I am a...
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ContactType })}
                    className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                    required
                  >
                    <option value="patient">Patient</option>
                    <option value="professional">Healthcare Professional</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                      required
                      pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone (optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                      pattern="[0-9\+\-\(\)\s]*"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                    required
                    minLength={10}
                    maxLength={2000}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}