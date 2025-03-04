import React from 'react';

const RefundCancellationCard = () => {
  // Define inline styles
  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    margin: '20px',
    padding: '20px',
    backgroundColor: '#fff',
  };

  const cardHeaderStyle = {
    backgroundColor: '#f44336', // Red color
    color: '#fff',
    padding: '10px',
    textAlign: 'center',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
  };

  const cardBodyStyle = {
    padding: '15px',
    lineHeight: '1.6',
  };

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <h3>Terms & Conditions</h3>
      </div>
      <div style={cardBodyStyle}>
      <p>This site is owned by Gaya Business Service, Surat. Gaya Business Service, Surat makes no representation that the information in the site is appropriate or available for use places other than India. Further, User may note that access to the Site from territories where the Information is illegal is prohibited.</p>

<p>Those who choose to access this Site from places other than India do so, on their own initiative and are responsible for compliance with applicable local laws. User may not use or export the information in violation of Indian Laws and regulations. Please ensure that User fully comply with the laws of the country from where he/she accesses the Site.</p>

<p>The laws of India shall govern any claim relating to the information by any user without giving any effect to any principles of conflicts of laws. Any waiver or amendment of any of these legal notices will be effective only if signed by the Company and failure of the Company to exercise or enforce of these legal notices shall not constitute a waiver of such right or provision. The Courts of Surat, India shall have exclusive jurisdiction in relation to any dispute regarding the use or access of the Site.</p>

<p>User may not assign, sub-license or otherwise transfer any of User’s right under these names. If any provision of these Terms is found to be invalid, the invalidity of that provision will not affect the validity of the remaining provisions of these Terms, which shall remain in full force and effect.</p>

<p>Gaya Business service, Surat shall have no liability to the User for any interruption or delay in access to the Site irrespective of the cause. User is responsible for the use of the Site and preventing any unauthorized use of User’s registration. User is under an obligation to keep your password strictly confidential. If you believe that there has been any breach of security such as disclosure, theft or unauthorized access or use of user name and password, User must notify Gaya Business Service, Surat immediately. Gaya Business Service, Surat disclaims all liabilities in respect of any such unauthorized access or use.</p>

      </div>
    </div>
  );
};

export default RefundCancellationCard;
