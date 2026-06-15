package mth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mth.models.Roles;

@Repository
public interface RoleRepository extends JpaRepository<Roles, Long> {

}
