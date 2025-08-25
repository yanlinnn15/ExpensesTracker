import React from 'react';
import PropTypes from 'prop-types';

const PageContainer = ({ children }) => (
    <div>{children}</div>
);

PageContainer.propTypes = {
    children: PropTypes.node
};

export default PageContainer;
