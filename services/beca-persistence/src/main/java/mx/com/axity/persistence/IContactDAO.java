package mx.com.axity.persistence;

import mx.com.axity.model.ContactDO;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IContactDAO extends CrudRepository <ContactDO, Long> {
    List<ContactDO> findByNameContainingAndLastNameContaining(String name, String lastName);
    List<ContactDO> findByNameContaining(String name);

    @Query("from ContactDO c where lower(c.name) like concat ('%',:name,'%')")
    List<ContactDO> getByNameWithQuery(@Param("name") String name);

    @Query("from ContactDO c where lower(c.name) like concat ('%',:name,'%') and lower(c.lastName) like concat ('%',:lastName,'%')")
    List<ContactDO> getByNameAndLastNameWithQuery(@Param("name")  String name, @Param("lastName") String lastName);

    //@Query("from ContactDO c where lower(c.name) like :name and lower(c.lastName)like :lastName")
    //List<ContactDO> getByNameAndLastNameWithQuery(@Param("name") String name, @Param("lastName") String lastName);
}
