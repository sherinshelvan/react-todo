import React from 'react';
import Controller from '../Controller';
import firebase from '../Firebase';
import { Link } from 'react-router-dom';
import SideNavigation from '../includes/SideNavigaton';

class TodoDetails extends Controller {
	constructor(props){
		super(props);
		this.state = {
			db : firebase.database(),
			isLoaded   : false,
			data : ""
		};
		this._isMounted = false;
	}
	async componentDidMount(){
		this._isMounted = true;
		const {match : {params}} = this.props;
		const {db} = this.state;
		var user = await this.token_validate();
		if(params && params.id){
			var snapshot = await db.ref('todo/'+params.id).once('value');
			var data = snapshot.val();
			if(!data || (data && user.role !== 'admin' && String(user.id) !== String(data['assigned_to']))){
				this._isMounted = false;
				this.props.history.push("/access-denied");
			}
			this._isMounted && data && this.setState({ user: user, isLoaded : true, data : JSON.parse(JSON.stringify(data))});
		}
	}
	componentWillUnmount = () => {
	    this._isMounted = false;
	};
	
	render(){
		var {isLoaded, data, user} = this.state;
		if(!isLoaded || !data || data === null){
			return null;
		}
		console.log(data);
		return (<div className="main-wrapper">			
			<div className="top-bg gradient-45deg-indigo-purple"></div>
			<SideNavigation user={user} />
			<div id="main-content">
				<div className="container">			
					<div className="page-title">
					    <h3 className="white-text">ToDo Details</h3>
					</div>
					
					<div className="card">
						<div className="inner">
							<div className="row">
								<div className="col s6">
									<h3>{data.title}</h3>
									<div>{data.description}</div>
									<table className="todo-details">
										<tbody>
											<tr>
												<th>Project</th>
												<td>{data.project_name}</td>
											</tr>
											<tr>
												<th>Responsibility</th>
												<td>{data.assigned_user}</td>
											</tr>
											<tr>
												<th>Status</th>
												<td>{data.active? "Active" : "Inactive"}</td>
											</tr>
										</tbody>
									</table>
								</div>
								<div className="col s6 task-list">
									<h4>Tasks</h4>
									<div className="item-task completed">
									task1
									</div>
									<div className="item-task">
									task2
									</div>
								</div>
					        </div>
						</div>
					</div>
				</div>
			</div>
		</div>)
	}
}
export default TodoDetails;
