import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { PayPalButton } from 'react-paypal-button-v2'
import { Link } from 'react-router-dom'
import {
	Row,
	Col,
	ListGroup,
	Image,
	Card,
	Alert,
	Button
} from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import Message from '../components/Message'
import Loader from '../components/Loader'
import {
	getOrderDetails,
	payOrder,
	deliverOrder
} from '../actions/orderActions'
import {
	ORDER_PAY_RESET,
	ORDER_DELIVER_RESET
} from '../constants/orderConstants'

//* *//* *//* *//* *//* *//* *//* *//* *//* *//* *//* *//* *//* */
const OrderScreen = ({ match, history }) => {
	const SHIPPING_MIN = 200
	const orderId = match.params.id

	const [sdkReady, setSdkReady] = useState(false)
	const dispatch = useDispatch()

	const { loading, error, order } = useSelector(state => state.orderDetails)

	const { loading: loadingPay, success: successPay } = useSelector(
		state => state.orderPay
	)

	const { loading: loadingDeliver, success: successDeliver } = useSelector(
		state => state.orderDeliver
	)

	const { userInfo } = useSelector(state => state.userLogin)

	if (!loading) {
		// Calculate prices
		const addDecimals = num => {
			return (Math.round(num * 100) / 100).toFixed(2)
		}

		order.itemsPrice = addDecimals(
			order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
		)
	}

	useEffect(() => {
		if (!userInfo) {
			history.push('/login')
		}

		const addPayPalScript = async () => {
			const { data: clientId } = await axios.get('/api/config/paypal')

			const script = document.createElement('script')
			script.type = 'text/javascript'
			script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`
			script.async = true
			script.onload = () => {
				setSdkReady(true)
			}

			document.body.appendChild(script)
		}

		if (!order || successPay || successDeliver) {
			dispatch({ type: ORDER_PAY_RESET })
			dispatch({ type: ORDER_DELIVER_RESET })
			dispatch(getOrderDetails(orderId))
		} else if (!order.isPaid) {
			if (!window.paypal) {
				addPayPalScript()
			} else {
				setSdkReady(true)
			}
		}
	}, [dispatch, orderId, successPay, successDeliver, order, userInfo, history])

	const successPaymentHandler = paymentResult => {
		console.log(paymentResult)
		dispatch(payOrder(orderId, paymentResult))
	}

	const deliverHandler = () => {
		dispatch(deliverOrder(order))
	}

	return loading ? (
		<Loader />
	) : error ? (
		<Message variant='danger'>{error}</Message>
	) : (
		<>
			<h1 className='mb-2'>Order {order._id}</h1>

			<Row>
				<Col md={8}>
					<ListGroup variant='flush'>
						<ListGroup.Item className='text-light'>
							<h2>Shipping</h2>
							<p>
								<strong>Name:</strong>{' '}
								<span className='lead'> {order.user.name}</span>
							</p>
							<p>
								<strong>Email:</strong>{' '}
								<a className='text-primary' href={`mailto:${order.user.email}`}>
									{order.user.email}
								</a>
							</p>
							<p>
								<strong>Address: </strong>
								{`${order.shippingAddress.address}, ${order.shippingAddress.postalCode}
								${order.shippingAddress.city}, ${order.shippingAddress.country}`}
							</p>
							{order.isDelivered ? (
								<Alert variant='info'>Delivered on {order.deliveredAt}</Alert>
							) : (
								<Alert variant='primary'>Not delivered</Alert>
							)}

							<hr />
						</ListGroup.Item>

						<ListGroup.Item className='text-light'>
							<h2>Payment Method</h2>
							<p>
								<strong>Method: </strong>
								<span className='lead'>{order.paymentMethod}</span>
							</p>
							{order.isPaid ? (
								<Alert variant='info'>Paid on {order.paidAt}</Alert>
							) : (
								<Alert variant='primary'>Not paid</Alert>
							)}

							<hr />
						</ListGroup.Item>

						<ListGroup.Item className='text-light'>
							<h2>Order Items</h2>
							{order.orderItems.lenght === 0 ? (
								<Message>Your order is empty</Message>
							) : (
								<ListGroup variant='flush'>
									{order.orderItems.map((item, index) => (
										<ListGroup.Item key={index}>
											<Row>
												<Col md={1}>
													<Image
														src={item.image}
														alt={item.name}
														fluid
														rounded
													/>
												</Col>
												<Col>
													<Link to={`/product/${item.product}`}>
														{item.name}
													</Link>
												</Col>
												<Col className='text-light' md={4}>
													{item.qty} x ${item.price} = ${item.qty * item.price}
												</Col>
											</Row>
										</ListGroup.Item>
									))}
								</ListGroup>
							)}
						</ListGroup.Item>
					</ListGroup>
				</Col>
				<Col md={4}>
					<Card>
						<ListGroup variant='flush'>
							<ListGroup.Item className='text-light'>
								<h2>Order Summary</h2>
							</ListGroup.Item>

							<ListGroup.Item className='text-light'>
								<Row>
									<Col>Items</Col>
									<Col>${order.itemsPrice}</Col>
								</Row>
							</ListGroup.Item>

							<ListGroup.Item className='text-light'>
								<Row>
									<Col>
										Shipping<span className='text-muted'>*</span>
									</Col>
									<Col>${order.shippingPrice}</Col>
								</Row>
							</ListGroup.Item>

							<ListGroup.Item className='text-light'>
								<Row>
									<Col>Tax</Col>
									<Col>${order.taxPrice}</Col>
								</Row>
							</ListGroup.Item>

							<ListGroup.Item className='text-light'>
								<Row>
									<hr />
									<Col>Total</Col>
									<Col className='text-primary fw-bold'>
										${order.totalPrice}
									</Col>
								</Row>
							</ListGroup.Item>
							{!order.isPaid && (
								<ListGroup.Item>
									{loadingPay && <Loader />}
									{!sdkReady ? (
										<Loader />
									) : (
										<PayPalButton
											amount={order.totalPrice}
											onSuccess={successPaymentHandler}
										/>
									)}
								</ListGroup.Item>
							)}
							{loadingDeliver && <Loader />}
							{userInfo &&
								userInfo.isAdmin &&
								order.isPaid &&
								!order.isDelivered && (
									<ListGroup.Item>
										<Row>
											<Button
												type='button'
												className='btn btn-block'
												onClick={deliverHandler}
											>
												Mark As Delivered
											</Button>
										</Row>
									</ListGroup.Item>
								)}
						</ListGroup>
					</Card>
					<p className='text-muted'>
						*Shipping is free for orders over ${SHIPPING_MIN}
					</p>
				</Col>
			</Row>
		</>
	)
}

export default OrderScreen
