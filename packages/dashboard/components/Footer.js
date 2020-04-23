import React from 'react';

export default function Footer() {
  return (
    <footer className="footer section">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 ml-auto col-sm-6">
            <div className="widget">
              <div className="logo mb-4">
                <h3 className="text-white">Aquarius</h3>
              </div>
              <a href="tel:+23-345-67890" className="text-white">
                @IanMitchel1
              </a>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="widget text-white">
              <h4 className="text-capitalize mb-4 text-white">Company</h4>

              <ul className="list-unstyled footer-menu lh-35">
                <li>
                  <a href="#">Terms & Conditions</a>
                </li>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Support</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 col-sm-6">
            <div className="widget">
              <h4 className="text-capitalize mb-4 text-white">Quick Links</h4>

              <ul className="list-unstyled footer-menu lh-35">
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Services</a>
                </li>
                <li>
                  <a href="#">Team</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
