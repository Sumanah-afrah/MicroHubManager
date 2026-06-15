package mth.service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
	  public final String SECRETE_KEY = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0987654321";
	  public final SecretKey key = Keys.hmacShaKeyFor(SECRETE_KEY.getBytes());
	  public Object generateJWT(Object username, Object role, Object id) throws Exception
	  {
	    Map<String, Object> payload = new HashMap<>();
	    payload.put("username", username);
	    payload.put("role", role);
	    payload.put("crid", id);
	    
	    return Jwts.builder()
	        .claims(payload)
	        .issuedAt(new Date())
	        .expiration(new Date(new Date().getTime() + 86400000))
	        .signWith(key)    
	        .compact();
	  }
	  public Map<String,Object> validateJWT(String token)throws Exception
	  {
	    Claims claims = Jwts.parser()
	              .verifyWith(key)
	              .build()
	              .parseSignedClaims(token)
	              .getPayload();
	    Date expiration = claims.getExpiration();
	    Map<String, Object> payload  = new HashMap<>();
	    if(expiration == null || expiration.before(new Date()))
	      throw new Exception("Invalid Token!");
	    payload.put("username", claims.get("username"));
	    payload.put("role", claims.get("role"));
	    return payload;
	  }   }