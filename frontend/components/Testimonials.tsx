export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah & Michael",
      location: "New York, NY",
      rating: 5,
      comment: "Perfect Proposal helped me create the most magical moment of my life. The AI suggestions were incredibly personal and thoughtful. She said yes!",
      date: "2 weeks ago",
      image: "👰‍♀️"
    },
    {
      id: 2,
      name: "Emily & James",
      location: "Los Angeles, CA",
      rating: 5,
      comment: "I was so nervous about proposing, but this tool gave me the confidence I needed. The personalized speech brought tears to her eyes!",
      date: "1 month ago",
      image: "💕"
    },
    {
      id: 3,
      name: "Jessica & David",
      location: "Chicago, IL",
      rating: 5,
      comment: "The proposal ideas were so creative and unique. It felt like it was written just for us. Highly recommend to anyone planning to propose!",
      date: "1 month ago",
      image: "💍"
    },
    {
      id: 4,
      name: "Amanda & Chris",
      location: "Miami, FL",
      rating: 5,
      comment: "From the location suggestions to the perfect words to say, every detail was perfect. This made our engagement story absolutely beautiful.",
      date: "2 months ago",
      image: "🌹"
    },
    {
      id: 5,
      name: "Rachel & Tom",
      location: "Seattle, WA",
      rating: 5,
      comment: "The AI understood our relationship so well! The proposal was intimate, romantic, and everything she dreamed of. Thank you!",
      date: "3 months ago",
      image: "✨"
    },
    {
      id: 6,
      name: "Lisa & Mark",
      location: "Boston, MA",
      rating: 5,
      comment: "Best investment I made for my proposal. The suggestions were spot-on and made the moment unforgettable. 5 stars!",
      date: "3 months ago",
      image: "💐"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Love Stories We've Helped Create
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy couples who started their forever with our help
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">{testimonial.image}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {renderStars(testimonial.rating)}
              </div>
              
              <p className="text-gray-700 mb-4 italic">
                "{testimonial.comment}"
              </p>
              
              <p className="text-sm text-gray-500 text-right">
                {testimonial.date}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Create Your Perfect Proposal Story?
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Join over 10,000+ couples who have created unforgettable moments with Perfect Proposal
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors">
                Start Your Story
              </button>
              <button className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition-colors">
                Read More Stories
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
