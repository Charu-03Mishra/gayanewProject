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
        <h3>Privacy Policy</h3>
      </div>
      <div style={cardBodyStyle}>
      <p>Gaya Business Service understands and serious about privacy issues. We don’t ask any personal information in order to access content of this website but in some cases, we may request you to provide your personal information which will be protected and will not be disclosed to any company, individual or for illegal usage.</p>
        <p>We don’t capture any information, if user wishes to provide his information or wants to be contacted, he may use electronic forms on this website.</p>
        <p>If user decides not to be contacted at a future date, this would be respected and the user would not be contacted.</p>
        <p>The information provided by the user will be kept in utmost confidentiality and will be used only for the purpose provided for and by the concerned department only.</p>
        <p>The information will not be shared, rented or sold to any third party.</p>
        <p>Gaya Business Service retains the right to contact the user at any time unless specified otherwise.</p>
        <p>We will send the emails to the user at the email given by the user. In case the user chooses not to receive the emails we will take steps to remove the user from our mailing list.</p>
        <p>Gaya Business Service is not responsible for the privacy practices or the content of the sites with links on this site.</p>

        <h4 class="font-weight-semibold">OUR CANCELATION POLICY</h4>
		•	There is no refund closure after the Member chooses to participate in the event. They cannot claim for refund under any circumstances.<br/><br/>
		•	The event charges money according to the event in which the customer has applied for. The event basically is of two days and customer can apply for either of the day or both the days.<br/><br/>
		•	The charges are as per the company and excluding GST<br/><br/>
		•	Registration once done cannot be exchanged, cancelled or refunded.<br/><br/>
		•	Jurisdiction would be reserved to Surat.<br/><br/>
      </div>
    </div>
  );
};

export default RefundCancellationCard;
