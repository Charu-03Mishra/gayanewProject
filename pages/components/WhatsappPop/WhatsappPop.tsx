const WhatsappPop = () => {
	const handleWhatsAppClick = () => {
		const phoneNumber = "9027144850";
		const message = "Hello, I have a question.";
		const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
			message
		)}`;

		window.location.href = whatsappUrl;
	};
	return (
		<div className="whatsapp-pop ">
			<div className="help">
				<div className="whatsapp">
					<div className="whatsapp-Imag" onClick={handleWhatsAppClick}>
						<img src="/assets/images/dashboard/whatsapp.png" alt="" />
					</div>
				</div>
				<p>Need Help ?</p>
			</div>
		</div>
	);
};

export default WhatsappPop;
