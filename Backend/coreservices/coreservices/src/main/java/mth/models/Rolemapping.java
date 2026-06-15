package mth.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "rolemapping")
public class Rolemapping
{
	@Id
	Long role;
	Long mid;
	public Long getRole() {
		return role;
	}
	public void setRole(Long role) {
		this.role = role;
	}
	public Long getMid() {
		return mid;
	}
	public void setMid(Long mid) {
		this.mid = mid;
	}
	@Override
	public String toString() {
		return "Rolemapping [role=" + role + ", mid=" + mid + "]";
	}
	
}