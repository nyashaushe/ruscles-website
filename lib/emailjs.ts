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
    // Customer Information
    firstName: data.firstName,
    lastName: data.lastName,
    fullName: `${data.firstName} ${data.lastName}`,
    email: data.email,
    phone: data.phone,

    // Service Details
    service: data.service,
    serviceFormatted: formatServiceName(data.service),
    propertyType: data.propertyType || 'Not specified',
    propertyTypeFormatted: formatPropertyType(data.propertyType),

    // Project Details
    message: data.message,
    timeline: data.timeline || 'Not specified',
    timelineFormatted: formatTimeline(data.timeline),
    emergency: data.emergency ? 'Yes' : 'No',
    emergencyFlag: data.emergency ? '🚨 URGENT' : '',

    // Additional Information
    submissionDate: new Date().toLocaleDateString(),
    submissionTime: new Date().toLocaleTimeString(),
    priority: data.emergency ? 'URGENT' : 'MEDIUM',

    // Formatted summary for email body
    customerSummary: `
Customer: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
Service: ${formatServiceName(data.service)}
Property: ${formatPropertyType(data.propertyType)}
Timeline: ${formatTimeline(data.timeline)}
Emergency: ${data.emergency ? 'YES - URGENT' : 'No'}

Message:
${data.message}
    `.trim(),

    // Individual fields for easy template access
    customerName: `${data.firstName} ${data.lastName}`,
    customerEmail: data.email,
    customerPhone: data.phone,
    serviceRequested: formatServiceName(data.service),
    propertyTypeRequested: formatPropertyType(data.propertyType),
    timelineRequested: formatTimeline(data.timeline),
    isEmergency: data.emergency,
    customerMessage: data.message
  };

  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
}

// Helper functions to format the data for better readability
function formatServiceName(service: string): string {
  const serviceMap: { [key: string]: string } = {
    'electrical-wiring': 'Electrical Wiring',
    'electrical-repairs': 'Electrical Repairs',
    'air-conditioning': 'Air Conditioning',
    'cold-rooms': 'Cold Rooms',
    'refrigeration': 'Refrigeration (Fridges/Freezers)',
    'maintenance': 'Maintenance Service',
    'emergency': 'Emergency Service',
    'other': 'Other'
  };
  return serviceMap[service] || service;
}

function formatPropertyType(propertyType: string): string {
  if (!propertyType) return 'Not specified';
  const propertyMap: { [key: string]: string } = {
    'residential': 'Residential',
    'commercial': 'Commercial',
    'industrial': 'Industrial'
  };
  return propertyMap[propertyType] || propertyType;
}

function formatTimeline(timeline: string): string {
  if (!timeline) return 'Not specified';
  const timelineMap: { [key: string]: string } = {
    'asap': 'As soon as possible',
    'this-week': 'This week',
    'next-week': 'Next week',
    'this-month': 'This month',
    'flexible': 'I\'m flexible'
  };
  return timelineMap[timeline] || timeline;
}
