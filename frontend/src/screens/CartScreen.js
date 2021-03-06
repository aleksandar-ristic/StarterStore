import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Message from '../components/Message'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap'
import { addToCart, removeFromCart } from '../actions/cartActions'

const CartScreen = ({ match, history, location }) => {
	const productId = match.params.id

	const qty = location.search ? Number(location.search.split('=')[1]) : 1

	const dispatch = useDispatch()

	const { cartItems } = useSelector(state => state.cart)

	useEffect(() => {
		if (productId) {
			dispatch(addToCart(productId, qty))
		}
	}, [dispatch, productId, qty])

	const removeFromCartHandler = id => {
		dispatch(removeFromCart(id))
	}

	const checkoutHandler = () => {
		history.push('/login?redirect=shipping')
	}

	return (
		<Row>
			<Col md={8}>
				<h1 className='mb-2'>Shopping Cart</h1>
				{cartItems.length === 0 ? (
					<Message>
						Your cart is empty.{' '}
						<Link className='text-info' to='/'>
							Go back
						</Link>
					</Message>
				) : (
					<ListGroup variant='flush'>
						{cartItems.map(item => (
							<ListGroup.Item className='text-light' key={item.product}>
								<Row>
									<Col md={2}>
										<Image src={item.image} alt={item.name} fluid rounded />
									</Col>
									<Col md={3}>
										<Link to={`/product/${item.product}`}>{item.name}</Link>
									</Col>
									<Col className='lead' md={2}>
										${item.price}
									</Col>
									<Col md={2}>
										<Form.Control
											as='select'
											value={item.qty}
											onChange={e =>
												dispatch(
													addToCart(item.product, Number(e.target.value))
												)
											}
										>
											{[...Array(item.countInStock).keys()].map(x => (
												<option key={x + 1} value={x + 1}>
													{x + 1}
												</option>
											))}
										</Form.Control>
									</Col>
									<Col md={2}>
										<Button
											type='button'
											variant='none'
											onClick={() => removeFromCartHandler(item.product)}
										>
											<i className='fas fa-trash text-primary'></i>
										</Button>
									</Col>
								</Row>
							</ListGroup.Item>
						))}
					</ListGroup>
				)}
			</Col>
			<Col md={4}>
				<Card>
					<ListGroup variant='flush'>
						<ListGroup.Item className='text-light'>
							<Row>
								<h3 className='fw-light'>
									Subtotal{' '}
									<span className='text-info fw-bold'>
										{cartItems.reduce((acc, item) => acc + item.qty, 0)}
									</span>{' '}
									items
								</h3>
								<h4 className='text-primary'>
									$
									{cartItems
										.reduce((acc, item) => acc + item.qty * item.price, 0)
										.toFixed(2)}
								</h4>
							</Row>
						</ListGroup.Item>
						<ListGroup.Item>
							<Row>
								<Button
									type='button'
									className='btn-block'
									disabled={cartItems.length === 0}
									onClick={checkoutHandler}
								>
									Proceed To Checkout
								</Button>
							</Row>
						</ListGroup.Item>
					</ListGroup>
				</Card>
			</Col>
		</Row>
	)
}

export default CartScreen
