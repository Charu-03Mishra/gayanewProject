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
        <h3>Refund & Cancellation</h3>
      </div>
      <div style={cardBodyStyle}>
      In the event there is any claim for of charge back by the User for any reason whatsoever, such User shall immediately call Gaya Business service, Surat with his/ her claim details and claim refund from Gaya Business Service, Surat alone. Such refund (if any) shall be effected only by Gaya Business Service, Surat via payment gateway or by means of a demand draft or such other means as Gaya Business Service, Surat, deems appropriate. No claims for refund/ charge back shall be made by any User to the Payment Service Provider(s) and in the event such claim is made it shall not be entertained.<br/><br/>
     <br/><br/> Once the fees paid successfully, the money will not be refunded. In these Terms and Conditions, The term "Charge Back" shall mean, approved and settled Credit card or net banking purchase transaction(s) which are at any time refused, debited or charged back to merchant account (and shall also include similar debits to Payment Service Provider's accounts, if any) by the acquiring bank or credit card company for any reason what so ever, together with the bank fees, penalties and other charges incidental thereto.
      </div>
    </div>
  );
};

export default RefundCancellationCard;
