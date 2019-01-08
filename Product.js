import React from 'react';
import styles from './Product.module.css';
import axios from 'axios';
import {connect} from 'react-redux';
import {addProduct, resetProductsState} from "../../actions/index";
import Paginasion from '../Pagination/pagination';
import PropTypes from 'prop-types';
import {Grid, Row, Col, Button, ButtonToolbar} from "react-bootstrap";

function mapDispatchToProps(dispatch) {
    return {
        addProduct: product => dispatch(addProduct(product)),
        resetProductsState: payload => dispatch(resetProductsState(payload)),
    };
}

const mapStateToProps = state => {
    return {
        products: state.products,
        page: state.page,
    };
};

class ConnectedProduct extends React.Component {

    static propTypes = {
        itemsPerPage: PropTypes.number.isRequired,
    }

    static defaultProps = {
        itemsPerPage: 10,
    }

    constructor(props) {
        super(props);
        this.state = {
            requestCompleted: false,
            totalItems: 0,
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.page !== this.props.page) {
            this.props.resetProductsState({page: this.props.page});
            axios.get('http://symfony.local/api/products', {
                headers: {
                    'Accept': 'application/ld+json'
                },
                params: {
                    page: this.props.page,
                    itemsPerPage: this.props.itemsPerPage
                }
            }).then(res => {
                const products = res.data;
                products['hydra:member'].map(product => this.props.addProduct(product));
                this.setState({
                    requestCompleted: true,
                    totalItems: products['hydra:totalItems'],
                });
            });
        }
    }

    componentDidMount() {

        axios.get('http://symfony.local/api/products', {
            headers: {
                'Accept': 'application/ld+json'
            },
            params: {
                page: this.props.page,
                itemsPerPage: this.props.itemsPerPage
            }
        }).then(res => {
            const products = res.data;
            products['hydra:member'].map(product => this.props.addProduct(product));
            this.setState({
                requestCompleted: true,
                totalItems: products['hydra:totalItems'],
            });
        });
    }


    render() {
        if (this.state.requestCompleted) {
            return (

                <Grid>
                    <Row>
                        <Col>
                            <Row>
                                {
                                    this.props.products.map(product => (
                                        <Col md={6} lg={4} className={styles.productCard}>
                                            <Col className={styles.card}>
                                                <img className={styles.cardImageTop}
                                                     src="https://dummyimage.com/600x400/55595c/fff"
                                                     alt="Card image cap"/>
                                                <Row className={styles.cardBody}>
                                                    <h4 className={styles.cardTitle}><a href="product.html"
                                                                                        title="View Product">{product.name}</a></h4>
                                                    <p className={styles.cardText}>{product.description}</p>
                                                    <Row className="text-center">
                                                        <ButtonToolbar className="text-center">
                                                            <Button bsStyle="danger" bsSize="small">
                                                                99.00 $
                                                            </Button>
                                                            <Button bsStyle="success" bsSize="small">
                                                                Add to cart
                                                            </Button>
                                                        </ButtonToolbar>
                                                    </Row>
                                                </Row>
                                            </Col>
                                        </Col>
                                    ))
                                }


                            </Row>
                        </Col>

                    </Row>
                    <Row>
                        <Paginasion totalItems={this.state.totalItems} itemsPerPage={10}/>
                    </Row>
                </Grid>
            )
        }
        return <div>Loading...</div>;
    }
}

const Product = connect(mapStateToProps, mapDispatchToProps)(ConnectedProduct);

export default Product;