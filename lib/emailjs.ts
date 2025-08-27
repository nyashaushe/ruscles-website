import emailjs from 'emailjs-com';

export async function sendContactEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  propertyType: string;
  message: string;
  timeline: string;
  emergency: boolean;
}) {
  // Replace these with your actual EmailJS service/template/public key
  const SERVICE_ID = 'service_xj9i1hl';
  const TEMPLATE_ID = 'template_afs2akj';
  const USER_ID = 'sTMqK39RpK0w-2noE';

  const templateParams = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    service: data.service,
    propertyType: data.propertyType,
    message: data.message,
    timeline: data.timeline,
    emergency: data.emergency ? 'Yes' : 'No',
  };

  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
}
