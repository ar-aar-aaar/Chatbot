package mx.com.axity.persistence;

import mx.com.axity.model.ContactDO;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IContactDAO extends CrudRepository <ContactDO, Long> {
    List<ContactDO> findByName(String name);
    List<ContactDO> findByNameAndLastName(String name, String lastName);
    List<ContactDO> findByNameContaining(String name);
    List<ContactDO> findByNameLike(String name);

    //@Query("SELECT u FROM contacs u WHERE LOWER(u.ds_name) = ?1")
    //ContactDO findByNameQ(String name);

}
