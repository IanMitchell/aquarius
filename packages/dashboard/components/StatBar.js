import React from 'react';

export default function StatBar() {
  return (
    <section className="section counter">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div
              className="counter-item text-center mb-5 mb-lg-0 "
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h3 className="mb-0">
                <span className="counter-stat ">1730</span> +
              </h3>
              <p className="text-muted">Project Done</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div
              className="counter-item text-center mb-5 mb-lg-0"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <h3 className="mb-0">
                <span className="counter-stat ">125 </span>M{' '}
              </h3>
              <p className="text-muted">User Worldwide</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div
              className="counter-item text-center mb-5 mb-lg-0 "
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <h3 className="mb-0">
                <span className="counter-stat ">39</span>
              </h3>
              <p className="text-muted">Availble Country</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div
              className="counter-item text-center "
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <h3 className="mb-0">
                <span className="counter-stat ">14</span>
              </h3>
              <p className="text-muted">Award Winner </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
