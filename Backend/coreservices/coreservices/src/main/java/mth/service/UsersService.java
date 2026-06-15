package mth.service;

//import java.util.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import mth.models.Roles;
import mth.models.Users;
import mth.models.Menus;
import mth.repository.RoleRepository;
import mth.repository.UsersRepository;

@Service
public class UsersService {
	@Autowired
	UsersRepository UR;

	@Autowired
	JwtService JWT;
	
	@Autowired
	RoleRepository RR;

	public Object signup(Users U) {
		Map<String, Object> response = new HashMap<>();
		try {
			Object id = UR.checkByEmail(U.getEmail());
			if (id != null) {
				response.put("code", 501);
				response.put("message", "Email ID already registered");
			} else {
				U.setRole(1); // Setting default role to the new user
				U.setStatus(1); // Make the status of the user as active

				UR.save(U); // Insert into the database table (users)

				response.put("code", 200);
				response.put("message", "User account has been created.");
			}
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

		public Object signin(Map<String, Object> data)
	  {
	    Map<String, Object> response = new HashMap<>();
	    try
	    {
					Users U = UR.validateCredentials(data.get("username").toString(), data.get("password").toString());   //Validate user name and password
	      if(U != null)
	      {
	        response.put("code", 200);
	        response.put("jwt", JWT.generateJWT(data.get("username"), U.getRole(), U.getId())); //Generate JWT token and return as response
	      }
	      else
	      {
	        response.put("code", 404);
	        response.put("message", "Invalid Credentials!");
	      }
	    }catch(Exception e)
	    {
	      response.put("code", 500);
	      response.put("message", e.getMessage());
	    }
	    return response;
	  }

	public Object uinfo(String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			Map<String, Object> payload = JWT.validateJWT(token);
			String email = (String) payload.get("username");
			Users U = UR.findByEmail(email);
			List<Menus> menuList = UR.getMenus(Long.valueOf(U.getRole()));

			response.put("code", 200);
			response.put("fullname", U.getFullname());
			response.put("menulist", menuList);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	public Object getProfile(String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			Map<String, Object> payload = JWT.validateJWT(token);
			String email = (String) payload.get("username");
			Object user = UR.profileByEmail(email);

			response.put("code", 200);
			response.put("user", user);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	public Object getAllUsers(int page, int size, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token);
			Pageable pageable = PageRequest.of(page - 1, size);
			Page<Users> users = UR.findAll(pageable);
			
			List<Roles> roles = RR.findAll();

			response.put("code", 200);
			response.put("page", page);
			response.put("size", size);
			response.put("totalpages", users.getTotalPages());
			response.put("users", users.getContent());
			response.put("roles", roles);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	public Object saveUser(Users U, String token)
	{
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token);
			Object id = UR.checkByEmail(U.getEmail());
			if(id!=null)
				throw new Exception("Email ID already regitered");
			UR.save(U);
			response.put("code",200);
			response.put("message","New User Account has been created");
		}
		catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	public Object deleteUser(Long id,String token)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			JWT.validateJWT(token);
			UR.deleteById(id);
			response.put("code", 200);
			response.put("message", "User has been deleted");
		}
		catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	public Object updateUser(Long id,Users u,String token)
	{
		Map<String,Object> response=new HashMap<>();

		try
		{
			JWT.validateJWT(token);

			u.setId(id);

			response.put("code",200);
			response.put("message","User updated");
			response.put("data",UR.save(u));
		}
		catch(Exception e)
		{
			response.put("code",500);
			response.put("message",e.getMessage());
		}

		return response;
	}
	
	public Object searchUser(String key, String token)
	  {
	    Map<String, Object> response = new HashMap<>();
	    try
	    {
	      List<Object> users = UR.searchUser(key);
	      response.put("code", 200);
	      response.put("users", users);
	    }catch(Exception e)
	    {
	      response.put("code", 500);
	      response.put("message", e.getMessage());
	    }
	    return response;
	  }
}
