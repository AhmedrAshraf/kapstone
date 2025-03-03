export async function handleContactForm(formData: {
  name: string;
  email: string;
  phone: string;
  type: string;
  message: string;
}) {
  try {
    const response = await fetch('/functions/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling contact form:', error);
    throw error;
  }
}