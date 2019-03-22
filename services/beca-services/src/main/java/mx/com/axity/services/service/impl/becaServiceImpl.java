package mx.com.axity.services.service.impl;

import mx.com.axity.commons.to.UserTO;
import mx.com.axity.model.ContactDO;
import mx.com.axity.model.UserDO;
import mx.com.axity.persistence.IContactDAO;
import mx.com.axity.persistence.UserDAO;
import mx.com.axity.services.service.IbecaService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

@Service
public class becaServiceImpl implements IbecaService {

    static final Logger LOG = LogManager.getLogger(becaServiceImpl.class);

    @Autowired
    IContactDAO contactDAO;



    @Override
    public List<ContactDO> getContact(String name) {
        name = name.toLowerCase();
        LOG.info("->>>nombre service ->> " + name);
        return this.contactDAO.getByNameWithQuery(name);
        //return this.contactDAO.findByNameLike(name);
    }

    @Override
    public List<ContactDO> getContactNA(String name, String lastName) {
        name = name.toLowerCase();
        lastName = lastName.toLowerCase();
        LOG.info("->>>nombre service ->> " + name);
        LOG.info("-->>>apellido service -->> " + lastName);
        return this.contactDAO.getByNameAndLastNameWithQuery(name, lastName);
        //return this.contactDAO.getByNameWithQuery(name);
    }

    /*@Override
    public List<ContactDO> getContactQ(String name, String lastName) {
        name = name.toLowerCase();
        lastName = lastName.toLowerCase();
        LOG.info("->>>nombre service ->> " + name);
        LOG.info("-->>>apellido service -->> " + lastName);
        return this.contactDAO.getByNameAndLastNameWithQuery(name, lastName);
        //return this.contactDAO.getByNameWithQuery(name);
    }*/

}


